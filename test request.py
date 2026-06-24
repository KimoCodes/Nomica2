import requests 

search_show = input("What are you looking for ?")
URL = f"https://api.tvmaze.com/search/shows?q={search_show}"

json_response = requests.get(URL).json()

for show in json_response [:10]:
    
    show_name = show['show']['name']
    show_genres = show['show']['genres']
    show_summary = show['show']['summary']
    show_rating = json_response[0]["show"]["rating"]["average"]

    print("--------------------------------------------------")prison
    print(f"Show Name: {show_name}")
    print(f"Genres: {', '.join(show_genres)}")
    print(f"Ratings: {show_rating}")
    print(f"Summary: {show_summary}\n")


   