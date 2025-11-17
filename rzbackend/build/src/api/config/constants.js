"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.ERROR_CODES = {
    UNAUTHORIZED_CODE: 401, // for token expire
    NOT_FOUND_CODE: 404, // data not found
    SUCCESS_CODE: 200, // every success request
    FAIL_CODE: 400, // every failed request
    USER_EXISTS: 409,
    REQUIRE_PARAMETER: 422,
    CREATE_SUCCESS_CODE: 201,
};
Constants.ERROR_MESSAGES = {
    USER_ID_NOT_FOUND: 'Not Found - User id was not found',
    DATA_NOT_FOUND: 'Not Found - Data',
    AUTHORIZATION_REQUIRED: 'Authorization required',
    AUTHORIZATION_TOKEN_EXPIRED: 'Authorization token expired',
    AUTHORIZATION_TOKEN_INVALID_WITH_USERID: 'Authorization token not associated with this User Id'
};
Constants.SUCCESS_MESSAGE = {
    OK: 'Ok',
    CREATED: 'Created',
};
Constants.LUNGUAGE_SORT = {
    EN: 'en',
};
Constants.FIELDS = {
    PAGE_NO: 'page-no',
    PAGE_SIZE: 'page-search-limit',
};
Constants.VALIDATON_ERROR_MESSAGES = {
    NOT_VALID: 'is not valid.',
    REQUIRED: 'is require.',
};
Constants.ERROR_TYPES = {
    MISSING_REQUEST_PARAMETER: 'MissingRequiredParameterError',
    ASSET_ID_AND_MESUREMENT_ITEM_SET_ID_EXIST: 'AssetIdandItemsetIdAlreadyExistError',
    FIELD_NOT_VALID: 'FieldValidationError',
    DATA_NOT_FOUND: 'DataNotFoundError',
    USER_ID_EXIST: 'UserIdAlreadyExistError',
};
Constants.TABLES = {
    USER: 'users',
    USER_SESSION_LOGIN: 'users_session_login',
    Countries: 'countries',
    States: 'states',
    Cities: 'cities',
    Categories: 'Categories',
    Species: 'species',
    Productgroup: 'product_group',
    STORE: 'store',
    MEDIA: 'media',
    Feeder: 'feeders',
    Task: 'task',
    TaskOptions: 'task_options',
    UserTaskOptions: 'user_task_options',
    STORE_TASK_HISTORY: 'store_task_history',
    TASK_ORDER: 'task_sequence'
};
//# sourceMappingURL=constants.js.map