# Dicebooru

This website is a portfolio project to provide a universal connection between tabletop game players and map makers. 

## Context
Often tabletop GMs ("Game Masters"), especially those who play remotely over tools like Roll20, need tabletop maps to stage battles or place tokens. However, usually it's beyond the scope of a GM's work to hand-make these maps; as a result, they go searching for custom-made maps that are similar to the image in their mind. Map-makers aim to fill this need by creating vivid maps applicable for many situations.

## Problem
It can be difficult for game masters to find the maps they need: by making a Google search they might find a small selection of the available maps that suit their needs, but these may be low-resolution copies or worse, maps intended for purchase shared freely. To avoid this problem many map-makers use a subscription model through Patreon or similar sites, or they host their maps on individually-made websites. This harms discoverability of their maps and makes the GM's search more difficult.

## Solution
Dicebooru aims to be a repository of tabletop maps sorted by tags, features and image data to allow GMs to easily find a map that suits their needs. Maps are visible at a low fidelity: if freely available, the maps can be viewed at high resolution and downloaded freely. If the map-maker intends to charge for a map, then the map on Dicebooru instead links to a URL where the map can be purchased.

## Tech Stack
Dicebooru is made using Vue 3, Vuetify, and Vite. The backend is served with Supabase.

The website is currently available in beta at https://dicebooru.netlify.app/
