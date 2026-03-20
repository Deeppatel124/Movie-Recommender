

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
 
# This allows your React frontend to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React runs here by default
    allow_methods=["*"],
    allow_headers=["*"],
)
### Loading the files
movies = pd.read_csv("tmdb_5000_movies.csv")
credits = pd.read_csv("tmdb_5000_credits.csv")

### Merging two datasets
movies = movies.merge(credits, on="title")

### Selecting columns
movies = movies[["movie_id","title","overview","genres","keywords","cast","crew"]]

### Missing Values

movies.dropna(inplace=True)

### Changing columns format

import ast

def convert(obj):
    L = []
    for i in ast.literal_eval(obj) :
        L.append(i["name"])

    return L

movies["genres"] = movies["genres"].apply(convert)
movies["keywords"].iloc[0]
movies["keywords"] = movies["keywords"].apply(convert)
def convert2(obj):
    L = []
    counter = 0
    for i in ast.literal_eval(obj):
        if counter != 3:
            L.append(i["name"])
            counter += 1
        else:
            break
    return L
movies["cast"] = movies["cast"].apply(convert2)
def get_director(obj):
    L = []
    for i in ast.literal_eval(obj):
        if i["job"] == "Director":
            L.append(i["name"])
            break
        
    return L
movies["crew"] = movies["crew"].apply(get_director)
movies["overview"] = movies["overview"].apply(lambda x:x.split())
movies["genres"] = movies["genres"].apply(lambda x:[i.replace(" ","") for i in x])
movies["keywords"] = movies["keywords"].apply(lambda x:[i.replace(" ","") for i in x])
movies["cast"] = movies["cast"].apply(lambda x:[i.replace(" ","") for i in x])
movies["crew"] = movies["crew"].apply(lambda x:[i.replace(" ","") for i in x])
### Creating tag column
movies["tags"] = movies["overview"] + movies["genres"] + movies["keywords"] + movies["cast"] + movies["crew"]
### Creating new df
new_df = movies[["movie_id","title","tags"]]
new_df["tags"] = new_df["tags"].apply(lambda x:" ".join(x))
new_df["tags"] = new_df["tags"].apply(lambda x:x.lower())

from nltk.stem.porter import PorterStemmer
ps = PorterStemmer()
def stem(text):
    y = []

    for i in text.split():
        y.append(ps.stem(i))

    return " ".join(y)
new_df["tags"] = new_df["tags"].apply(stem)
### Vectoraization
from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer(max_features=5000,stop_words="english")
vectors = cv.fit_transform(new_df["tags"]).toarray()

### Cosine
from sklearn.metrics.pairwise import cosine_similarity
similarity = cosine_similarity(vectors)

def recommend(movie):
    # Case insensitive search
    match = new_df[new_df["title"].str.lower() == movie.lower()]
    
    if match.empty:
        return []

    movie_index = match.index[0]
    distances = similarity[movie_index]
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

    recommended = []
    for i in movies_list:
        recommended.append({
            "title": new_df.iloc[i[0]].title,
            "movie_id": int(new_df.iloc[i[0]].movie_id)
        })
    return recommended


@app.get("/movies")
def get_movies():
    titles = new_df["title"].tolist()
    return {"movies": titles}

@app.get("/recommend")
def get_recommendations(movie: str):
    results = recommend(movie)
    if not results:
        raise HTTPException(status_code=404, detail="Movie not found in dataset")
    return {"recommendations": results}
