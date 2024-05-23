export interface IAuthResponse {
   token: string;
   refreshToken: string;
}

export interface IReport {
   id: number;
   type: string;
   userId: number;
   profileUsername: string;
   timestamp: string;
   additionalInfo: {
      fanId?: number;
      unreadDuration?: number;
      bannedWord?: string;
   };
   createdAt: string;
}

export interface IUser {
   id: number;
   username: string;
   role: string;
   telegramId: string;
   createdAt: string;
   updatedAt: string;
   reports: IReport[];
}

export interface IUserResponse {
   user: IUser;
}
