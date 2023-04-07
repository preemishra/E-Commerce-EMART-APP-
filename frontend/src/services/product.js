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