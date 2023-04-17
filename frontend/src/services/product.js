export const getUserFromDb = async () => {
  try {
    const res = await fetch(
      `http://localhost:4000/api/user/view/all`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "email":JSON.parse(localStorage.getItem('loginDetails')).email 
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
      }
    );
    const user = await res.json();
    return await user
  } catch (error) {
    console.log(error);
  } 
};

export const deleteUserFromDb = async (id) => {
  try {
    const res = await fetch(
      `http://localhost:4000/api/user/admin/${id}`,
      {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
      }
    );
    const user = await res.json();
    return await user
  } catch (error) {
    console.log(error);
  } 
};

export const searchUserFromDb = async (id) => {
  try {
    const res = await fetch(
      `http://localhost:4000/api/user/admin/search?email=${id}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          // "x-access-token": sessionStorage.getItem("authorization"),
        },
      }
    );
    const user = await res.json();
    return await user
  } catch (error) {
    console.log(error);
  } 
};

export const getProductFromDb = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/product`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json" 
            // "x-access-token": sessionStorage.getItem("authorization"),
          },
        }
      );
      const product = await res.json();
      return await product
    } catch (error) {
      console.log(error);
    } 
  };

  export const searchProductFromDb = async (searchData) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/product/search/${searchData}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json" 
            // "x-access-token": sessionStorage.getItem("authorization"),
          },
        }
      );
      const product = await res.json();
      return await product
    } catch (error) {
      console.log(error);
    } 
  };
  

  export const getSingleProductFromDb = async (produtId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/product/${produtId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json" 
            // "x-access-token": sessionStorage.getItem("authorization"),
          },
        }
      );
      const product = await res.json();
      return await product
    } catch (error) {
      console.log(error);
    } 
  };