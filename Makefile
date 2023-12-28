install:
	npm ci

start:
	pm2 start "npm run start" -n marketplace-next

start-local:
	npm run dev

start-local-prod:
	npm run dev-prod

build:
	npm run build