// actions.js

export const CHANGE_LANGUAGE = 'changeLanguage';
export const CHANGE_USER_PROFILE = 'UserChangeManegement';
export const changeLanguage = (language) => {
    return {
        type: CHANGE_LANGUAGE,
        language,
    };
};

export const UserChangeManegement = (data) => {
    return {
        type: CHANGE_USER_PROFILE,
        payload: data,
    };
};
