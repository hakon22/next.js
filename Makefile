install:
	npm ci

start:
	pm2 start "npm run start" -n marketplace-next

start-local:
	npm run dev

build:
	npm run build