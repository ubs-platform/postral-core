import { Injectable } from "@nestjs/common";
import {Axios} from "axios";

@Injectable()
export class LoginOperator {

    readonly ubsUsersUrl = process.env.TESTO_UBS_USERS_URL || "http://localhost:4204/api/users";
    readonly loginUrl = this.ubsUsersUrl + "/auth";
    constructor(private readonly axios: InstanceType<typeof Axios>) { 
        console.info("LoginOperator initialized with loginUrl:", this.loginUrl);
        console.log(axios);
    }

    async login(username: string, password: string) {
    }
}