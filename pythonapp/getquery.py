#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import spacy
from spacy.matcher import Matcher
from tqdm import tqdm
import sys
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

nlp = spacy.load('en_core_web_sm')


def get_entities(sent):
    # chunk 1
    ent1 = ""
    ent2 = ""

    prv_tok_dep = ""    # dependency tag of previous token in the sentence
    prv_tok_text = ""   # previous token in the sentence

    prefix = ""
    modifier = ""
    #############################################################
    for tok in nlp(sent):
        # chunk 2
        # if token is a punctuation mark then move on to the next token
        if tok.dep_ != "punct":
            # check: token is a compound word or not
            if tok.dep_ == "compound":
                prefix = tok.text
                # if the previous word was also a 'compound' then add the current word to it
                if prv_tok_dep == "compound":
                    prefix = prv_tok_text + " " + tok.text

            # check: token is a modifier or not
            elif tok.dep_.endswith("mod") == True:
                modifier = tok.text
                # if the previous word was also a 'compound' then add the current word to it
                if prv_tok_dep == "compound":
                    modifier = prv_tok_text + " " + tok.text

            # chunk 3
            elif tok.dep_.find("subj") == True:
                ent1 = modifier + " " + prefix + " " + tok.text
                prefix = ""
                modifier = ""
                prv_tok_dep = ""
                prv_tok_text = ""

            # chunk 4
            elif tok.dep_.find("obj") == True:
                ent2 = modifier + " " + prefix + " " + tok.text

            # chunk 5
            # update variables
            prv_tok_dep = tok.dep_
            prv_tok_text = tok.text
    #############################################################
    return [ent1.strip(), ent2.strip()]


def get_relation(sent):

    doc = nlp(sent)

    # Matcher class object
    matcher = Matcher(nlp.vocab)

    # define the pattern
    pattern = [{'DEP': 'ROOT'},
               {'DEP': 'prep', 'OP': "?"},
               {'DEP': 'agent', 'OP': "?"},
               {'POS': 'ADJ', 'OP': "?"}]

    matcher.add("matching_1", [pattern])

    matches = matcher(doc)

    k = len(matches) - 1

    span = doc[matches[k][1]:matches[k][2]]

    return(span.text)


def QueryOnKG(path, query, flag):
    candidate_sentences = pd.read_csv(path)

    for ind, sen in enumerate(candidate_sentences['sentence']):
        candidate_sentences['sentence'][ind] = candidate_sentences['sentence'][ind].replace(
            "/", "//")

    entity_pairs = []
    for i in tqdm(candidate_sentences["sentence"]):
        entity_pairs.append(get_entities(i))

    relations = [get_relation(i)
                 for i in tqdm(candidate_sentences['sentence'])]
    source = [i[0] for i in entity_pairs]
    target = [i[1] for i in entity_pairs]

    kg_df = pd.DataFrame(
        {'entity_1': source, 'entity_2': target, 'relation': relations})

    if flag:
    # print(kg_df.query(query))
        return kg_df.query(query).to_json()
    else:
        return kg_df

def UpdateOnKG(path, query, column_update, value_update):
    try:
        return_kg = QueryOnKG(path, query, False)
        return_kg.loc[return_kg.query(query).index[0], column_update] = value_update
        res = []
        for index, row in return_kg.iterrows():
            if row['relation'] == 'stored with':
                res.append(row['entity_1'] + " " + 'is ' + row['relation'] + " " + row['entity_2'])
            else:
                res.append(row['entity_1'] + " " + row['relation'] + " " + row['entity_2'])
        df = pd.DataFrame(res, columns=['sentence'])
        
        for ind,sen in enumerate(df['sentence']):
            df['sentence'][ind] = df['sentence'][ind].replace("//","/")
        
        df.to_csv(path, index=False)
        return True
    except :
        print('error of update on KG')

if __name__ == '__main__':
    #sys.argv[3] => 'update' -> update 'query' -> query
    if sys.argv[3] == 'query':
        print(QueryOnKG(sys.argv[1], sys.argv[2], True))
    elif sys.argv[3] == 'update':
        #variable UpdateOnKG(path, string_query, which entity or relation or column, value of you want update)
        print(UpdateOnKG(sys.argv[1], sys.argv[2], sys.argv[4], sys.argv[5]))