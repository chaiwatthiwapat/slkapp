.PHONY: run down logs dev build check test

run:
	docker compose up -d --build --wait

down:
	docker compose down

logs:
	docker compose logs -f

dev:
	npm run dev

build:
	npm run build

check:
	npm run typecheck

test:
	npm run test:e2e
