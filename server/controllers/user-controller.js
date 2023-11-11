import UserService from "../service/user-service.js";
import userService from "../service/user-service.js";
import {validationResult} from "express-validator";
import {ApiError} from "../exceptions/api-error.js";



class UserController {
    async registration(req, res, next) {
        try {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', error.array()))
            }
            const {email, password} = req.body
            const userData = await UserService.registration(email, password)
            res.cookie('refresh', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            next(e)
        }
    }
    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const userData = await userService.login(email, password)
            res.cookie('refresh', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            next(e)
        }

    }

    async logout(req, res, next) {
        try {
            const {refresh} = req.cookies
            const token = await userService.logout(refresh)
            res.clearCookie('refresh')
            return res.json(token)

        } catch (e) {
            next(e)
        }
    }
    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refresh} = req.cookies
            const userData = await userService.refresh(refresh)

            res.cookie('refresh', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }
}


export default new UserController()