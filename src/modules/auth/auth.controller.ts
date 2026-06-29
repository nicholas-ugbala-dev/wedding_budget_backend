import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../../utils/helpers/response.handler";
import { IAuthService } from "./interface/auth.interface";
import authService from "./auth.service";
import { 
  RegisterValidator,
  LoginValidator,
  OnboardingValidator,
  ForgotPasswordValidator,
  ResetPasswordValidator,
} from "./validation/auth.validations";


export class AuthController {
    constructor(private readonly authService: IAuthService) {}

    register = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const data = req.body as RegisterValidator;

        const result = await this.authService.register(data);
        
        const response = new ResponseHandler(req, res);
        response.success({
            message: "Account created successfully",
            code: StatusCodes.CREATED,
            data: result,
        })
    };

    login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const data = req.body as LoginValidator;

        const result = await this.authService.login(data);

        const response = new ResponseHandler(req, res);
        response.success({
            message: "Login Successful",
            code: StatusCodes.OK,
            data: result,
        });
    };

     me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;

    const result = await this.authService.me(userId as string);

    const response = new ResponseHandler(req, res);
    response.success({
      message: 'User fetched successfully',
      code: StatusCodes.OK,
      data: result,
    });
  };

  updateOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const data = req.body as OnboardingValidator;

    const result = await this.authService.updateOnboarding(userId as string, data);

    const response = new ResponseHandler(req, res);
    response.success({
      message: 'Onboarding completed successfully',
      code: StatusCodes.OK,
      data: result,
    });
  };

  forgotPassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email } = req.body as ForgotPasswordValidator;

    await this.authService.forgotPassword(email);

    const response = new ResponseHandler(req, res);

    response.success({
      message: "If an account exists with this email, a reset link has ben sent",
      code: StatusCodes.OK,
    });
  }

  resetPassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { token, new_password } = req.body as ResetPasswordValidator;

    await this.authService.resetPassword(token, new_password);
    const response = new ResponseHandler(req, res);

    response.success({
      message: "Password reset successfully",
      code: StatusCodes.OK,
    })
  }
}

export const authController = new AuthController(authService);