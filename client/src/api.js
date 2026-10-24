// All server calls go through this file
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

export const getToken = () => localStorage.getItem("token");

export const getUserName = () => localStorage.getItem("userName");

export const saveLogin = (token,name) =>{

    localStorage.setItem("token",token);
    localStorage.setItem("userName",name);
}

export const clearLogin = () =>{

    localStorage.removeItem("token");
    localStorage.removeItem("userName");
}

export const apiRequest = async (path,options = {}) =>{

    const headers = {"Content-Type" : "application/json"};
    const token = getToken();

    if( token ){

        headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(API_URL + path,{
        method : options.method || "GET",
        headers : headers,
        body : options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));

    if( response.status === 401 ){

        clearLogin();
    }

    if( !response.ok ){

        throw new Error(data.msg || "Request failed with status " + response.status);
    }

    return data;
}
