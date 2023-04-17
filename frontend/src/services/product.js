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


  export const viewSellerProductFromDb = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/product/seller/${id}`,
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

  
  export const viewSellerOrdersFromDb = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/order/seller/${id}`,
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
  
  export const updateOrderServices = async (updateDetail) => {
    console.log(updateDetail)
    try {
      const res = await fetch(
        `http://localhost:4000/api/order/seller`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json" 
            // "x-access-token": sessionStorage.getItem("authorization"),
          },
          body: JSON.stringify(updateDetail),
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
      )
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