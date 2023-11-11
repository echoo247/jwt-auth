import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {UserModel} from "../models/user-models.js";
import mailService from "./mail-service.js";
import {UserDto} from "../dtos/user-dto.js";
import TokenService from "./token-service.js";
import {ApiError} from "../exceptions/api-error.js";
import tokenService from "./token-service.js";

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate)
            throw ApiError.BadRequest(`User with this ${email} email exists`)

        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuidv4();

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationEmail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user)
        const tokens = TokenService.generateTokens({...userDto})
        await TokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink: activationLink})
        if(!user)
            throw ApiError.BadRequest('Invalid activation link')
        user.isActivated = true
        await user.save()

    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user)
            throw ApiError.BadRequest(`User with this ${email} email not found`)

        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals)
            throw ApiError.BadRequest('Invalid password')

        const userDto = new UserDto(user)
        const tokens = TokenService.generateTokens({...userDto})

        await TokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refresh) {
        if(!refresh)
            throw ApiError.UnauthorizedError();

        const userData = tokenService.validateRefreshToken(refresh);
        const tokenFromDB = await tokenService.findToken(refresh)

        if(!tokenFromDB || !userData)
            throw ApiError.UnauthorizedError()

        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = TokenService.generateTokens({...userDto})

        await TokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto }
    }

    async getAllUsers() {
        const users = await UserModel.find()
        return users;
    }
}

export default new UserService

