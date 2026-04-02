export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string | null
}

export interface User {
  username: string
  token: string
}

export interface UserInfo {
  name: string
  type_: string
}

export interface ListUsersResponse {
  success: boolean
  message: string
  users: UserInfo[]
}

export interface ChangeAdminPasswordRequest {
  old_password: string
  new_password: string
}

export interface ChangeAdminPasswordResponse {
  success: boolean
  message: string
}

export interface ChangeSambaPasswordRequest {
  username: string
  new_password: string
}

export interface ChangeSambaPasswordResponse {
  success: boolean
  message: string
}

export interface ChangePasswdRequest {
  user_id: string
  new_password: string
}

export interface ChangePasswdResponse {
  success: boolean
  message: string
}

export interface AddUserRequest {
  username: string
  password: string
  user_type: string
}

export interface AddUserResponse {
  success: boolean
  message: string
}

export interface AddSambaUserRequest {
  username: string
  password: string
}

export interface AddSambaUserResponse {
  success: boolean
  message: string
}

export interface DeleteUserRequest {
  username: string
  token: string
}

export interface DeleteUserResponse {
  success: boolean
  message: string
}

export interface DeleteSambaUserRequest {
  username: string
  token: string
}

export interface DeleteSambaUserResponse {
  success: boolean
  message: string
}
