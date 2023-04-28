import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axios from 'axios';
import type Keycloak from 'keycloak-js';
import { inject, type App, type Plugin } from 'vue';

const AxiosInjectionKey = Symbol();

const AxiosPlugin: Plugin = {
  install(app: App, options: AxiosPluginConfig): void {
    const { keycloak } = options;
    const instance: AxiosInstance = axios.create(options);

    registerAxiosAuthorizationHeader(instance, keycloak);
    app.provide(AxiosInjectionKey, instance);
  },
};

/**
 * Registers an Axios interceptor to add an Authorization header with the
 * Keycloak token to all outgoing requests.
 *
 * @param {AxiosInstance} axios - an Axios instance to modify.
 * @param {Keycloak} keycloak - a Keycloak instance providing the token.
 */
function registerAxiosAuthorizationHeader(axios: AxiosInstance, keycloak: Keycloak): void {
  axios.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${keycloak.token!}`;
      return config;
    },
    (error) => Promise.reject(error),
  );
}

/**
 * Returns an instance of Axios.
 *
 * @returns {AxiosInstance} an instance of Axios with access control.
 * @throws {Error} if AxiosPlugin is not registered.
 */
function useAxios(): AxiosInstance {
  const axios = inject<AxiosInstance>(AxiosInjectionKey);
  if (!axios) {
    throw new Error('AxiosPlugin not registered.');
  }
  return axios;
}

interface AxiosPluginConfig extends CreateAxiosDefaults {
  keycloak: Keycloak;
}

export { AxiosInjectionKey, AxiosPlugin, useAxios, type AxiosPluginConfig };
