import { writable } from 'svelte/store';

export const CartItemsStore = writable({});
export const getSingleProductStore = writable({});
export const loginStore = writable(JSON.parse(localStorage.getItem('loggedInDetails')));


