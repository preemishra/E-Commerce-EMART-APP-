import { writable } from 'svelte/store';

export const CartItemsStore = writable({});
export const getSingleProductStore = writable({});
export const userDetail = writable();
export const loginStore = writable(localStorage.getItem('loggedInDetails'));


