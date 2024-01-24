/* eslint-disable import/no-cycle */
import express from 'express';
import passport from 'passport';
import Auth from './authentication/Auth.js';
import Activation from './activation/Activation.js';
import Market from './market/Market.js';
import Profile from './profile/Profile.js';

const router = express.Router();

const apiPath = '/marketplace/api';

const jwtToken = passport.authenticate('jwt', { session: false });

router.post(`${apiPath}/auth/signup`, Auth.signup);
router.post(`${apiPath}/auth/login`, Auth.login);
router.get(`${apiPath}/auth/google`, Auth.googleAuth);
router.post(`${apiPath}/auth/recoveryPassword`, Auth.recoveryPassword);
router.post(`${apiPath}/auth/logout`, Auth.logout);
router.get(`${apiPath}/auth/updateTokens`, passport.authenticate('jwt-refresh', { session: false }), Auth.updateTokens);

router.post(`${apiPath}/activation/`, Activation.activation);
router.get(`${apiPath}/activation/:id`, Activation.needsActivation);
router.get(`${apiPath}/activation/repeatEmail/:id`, Activation.repeatEmail);
router.post(`${apiPath}/activation/changeEmail`, Activation.changeEmail);

router.get(`${apiPath}/market/getAll`, Market.getAll);
router.post(`${apiPath}/market/upload`, jwtToken, Market.upload);
router.post(`${apiPath}/market/edit`, jwtToken, Market.edit);
router.delete(`${apiPath}/market/remove`, jwtToken, Market.remove);

router.post(`${apiPath}/profile/confirmEmail`, jwtToken, Profile.confirmEmail);
router.post(`${apiPath}/profile/changeData`, jwtToken, Profile.changeData);
router.post(`${apiPath}/profile/addAddress`, jwtToken, Profile.addAddress);
router.patch(`${apiPath}/profile/removeAddress`, jwtToken, Profile.removeAddress);
router.patch(`${apiPath}/profile/updateAddress`, jwtToken, Profile.updateAddress);
router.patch(`${apiPath}/profile/selectAddress`, jwtToken, Profile.selectAddress);

export default router;
