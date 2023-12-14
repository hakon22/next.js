import jwt from 'jsonwebtoken';

export const generateAccessToken = (id: number, email: string) => jwt.sign({ id, email }, process.env.KEY_TOKEN ?? '', { expiresIn: '10m' });
export const generateRefreshToken = (id: number, email: string) => jwt.sign({ id, email }, process.env.KEY_REFRESH_TOKEN ?? '', { expiresIn: '30d' });
