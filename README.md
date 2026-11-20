# MusicVenture

# ¿Alguien recuerda este juego?

<details>
<summary>Ver spoiler</summary>
<a href="https://postimages.org/" target="_blank"><img src="https://i.postimg.cc/RFJgtjNB/Captura-de-pantalla-2026-11-19-235140.png" alt="Captura-de-pantalla-2026-11-19-235140"></a><br><br>
<a href="https://postimages.org/" target="_blank"><img src="https://i.postimg.cc/PxvSDBPH/Captura-de-pantalla-2026-11-19-235255.png" alt="Captura-de-pantalla-2026-11-19-235255"></a><br><br>
</details>

Juego de adivinar canciones inspirado en el antiguo *Music Challenge* de Facebook.
Escuchas un fragmento de 30 segundos y eliges el título correcto antes de que
se acabe el tiempo. Proyecto de fans, sin fines de lucro.

## Cómo se juega

- Empiezas con **1:00** en el reloj. Cada acierto suma segundos (solo hasta el nivel 20).
- Los **niveles 1-5** usan canciones muy conocidas, los **6-10** medianamente
  conocidas y del **11 en adelante** viene el fondo del iceberg: lados B, escenas
  específicas, géneros de nicho y cortes profundos de artistas grandes.
- Tras los niveles 3, 5, 10, 15 y 20 llega una **etapa bonus**: adivina el artista
  de cada canción que sonó en el tramo.
- Las opciones incorrectas van desapareciendo durante 20 segundos; si no
  respondes a tiempo, cuenta como error.
- La partida termina si se acaba el tiempo, si fallas 5 veces seguidas o si
  llegas a 10 errores. Al final ves las canciones que salieron.

## Cómo funciona

- El audio no está incluido en el proyecto: los fragmentos se piden al momento
  de jugar a la API de búsqueda de iTunes.
- La base de datos solo contiene título y artista, organizados en tres tramos de dificultad.
- El sorteo es parejo por artista, para que ninguno acapare las partidas.
- Todo se configura al inicio del código: tiempo inicial, límites de error,
  segundos por tramo, tiendas de iTunes donde buscar y más.

## Cómo probarlo

1. Descarga el repositorio.
2. Abre `index.html` en tu navegador (necesita conexión a internet).

## Agregar canciones

Una línea por canción, en el tramo que corresponda:

```
Título|Artista
Título|Artista|https://music.apple.com/...   (link opcional para afinar el audio)
```

## Ideas pendientes

- Verificar con un script qué canciones tienen preview disponible
- Registrar aciertos por canción para ajustar los tramos con datos reales
- Ranking entre amigos
- Expandir biblioteca a canciones en español
- Sistema de registro por codigo

## Aviso

Music Venture es un proyecto de fans, sin fines de lucro y no oficial. No está
afiliado ni respaldado por MetroGames; los creadores del juego original *Music Challenge*
ni por ninguna plataforma o discográfica. Los nombres de canciones, artistas y
marcas pertenecen a sus respectivos dueños. El proyecto no aloja ni distribuye
audio, y el uso de la API de iTunes está sujeto a los términos de Apple.
El arte y el nombre son propios.

## ENGLISH

# MusicVenture

# Does anyone remember this game?

<details>
<summary>Show spoiler</summary>
<a href="https://postimages.org/" target="_blank"><img src="https://i.postimg.cc/RFJgtjNB/Captura-de-pantalla-2026-11-19-235140.png" alt="Captura-de-pantalla-2026-11-19-235140"></a><br><br>
<a href="https://postimages.org/" target="_blank"><img src="https://i.postimg.cc/PxvSDBPH/Captura-de-pantalla-2026-11-19-235255.png" alt="Captura-de-pantalla-2026-11-19-235255"></a><br><br>
</details>

A song-guessing game inspired by the old Facebook game *Music Challenge*.
You listen to a 30-second clip and pick the right title before time runs out.
A fan project, non-profit.

## How to play

- You start with **1:00** on the clock. Each correct answer adds seconds (only up to level 20).
- **Levels 1-5** use very well-known songs, **6-10** use moderately known ones,
  and from **11 onward** you reach the bottom of the iceberg: B-sides, specific
  scenes, niche genres and deep cuts from big artists.
- After levels 3, 5, 10, 15 and 20 comes a **bonus stage**: guess the artist of
  every song that played in that stretch.
- Incorrect options fade away over 20 seconds; if you don't answer in time,
  it counts as a mistake.
- The game ends if time runs out, if you get 5 wrong in a row, or if you reach
  10 mistakes. At the end you see the songs that came up.

## How it works

- No audio is included in the project: clips are requested from the iTunes
  Search API while you play.
- The database only contains title and artist, organized in three difficulty tiers.
- Songs are drawn evenly by artist, so no single artist dominates a game.
- Everything is configurable at the top of the code: starting time, error limits,
  seconds added per stretch, the iTunes stores to search, and more.

## Try it

1. Download the repository.
2. Open `index.html` in your browser (an internet connection is required).

## Adding songs

One line per song, in the tier it belongs to:

```
Title|Artist
Title|Artist|https://music.apple.com/...   (optional link to fine-tune the audio)
```

## Roadmap

- Script to check which songs have a preview available
- Track correct answers per song to adjust tiers with real data
- Friends leaderboard
- Amplify the music library with other languages songs
- Code sign-up system

## Disclaimer

MusicVenture is an unofficial, non-profit fan project. It is not affiliated with
or endorsed by MetroGames; the creators of the original game *Music Challenge* or by any
platform or record label. Song titles, artist names and trademarks belong to
their respective owners. The project does not host or distribute audio, and use
of the iTunes API is subject to Apple's terms. The name and artwork are original.
