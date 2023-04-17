
module.exports=(sequelize,DataTypes)=>{
    const CartDetail = sequelize.define('cart_details', {
     cart_details_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      cart_product_qty: {
        type: DataTypes.INTEGER  ,
        allowNull: false
      },
      unit_price: {
        type: DataTypes.DECIMAL  ,
        allowNull: false
      },
     created_by:{
        type:  DataTypes.STRING,
        allowNull: false
      },
      updated_by:{
        type:  DataTypes.STRING,
        allowNull: false
      }
    }, {
        tableName: 'cart_details',
        timestamps: true,
    });
    return CartDetail;
    }