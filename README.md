# Getting started

## Manually running everything
- Install [pnpm](https://pnpm.io/)
- Install [Python 3.12.6](https://www.python.org/downloads/release/python-3126/)

- Configure `.env` by copying `.env.example` to `.env` and setting the values correctly

### Setting up the migration
- Run `pnpm install` to install migration & frontend dependencies
- Run `pnpm dbmate up` to migrate the database

### Setting up backend
- Go to `backend` folder
- Run `pip install -r .\requirements.txt` to install all the dependencies

> It is recommended to use Python virtual environment with `python -m venv .venv`

### Running backend
- Within the `backend` folder
- Run `fastapi run ./main.py`

### Running frontend
- In the project root
- You can run `pnpn dev` to quickly run the frontend, but considering that the frontend is a static site, you can build it and host the `dist/index.html` using any service

## Running with Docker
- You can just run `docker compose up` and the page should be accessible in http://localhost:8000 

## Populating the database
Run `dummy_data.sql` in the database to populate the database with dummy data
