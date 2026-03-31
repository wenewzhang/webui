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
