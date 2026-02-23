import { AxiosInstance } from 'axios';
// CHANGE HERE: Use { route as ziggyRoute } instead of just ziggyRoute
import { route as ziggyRoute, Config as ZiggyConfig } from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    var route: typeof ziggyRoute;
    var Ziggy: ZiggyConfig;
}