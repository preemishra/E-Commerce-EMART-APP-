
module.exports=(sequelize,DataTypes)=>{
    const Product = sequelize.define('products', {
     product_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      product_name: {
        type: DataTypes.STRING,
         allowNull: false
      },
      descriptions: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL  ,
        allowNull: false
      },
      product_qty: {
        type: DataTypes.BIGINT  ,
        allowNull: false
      },
      picture:{
        type: DataTypes.STRING,
        allowNull: false,
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
        tableName: 'products',
        timestamps: false,
    });
    return Product;
    }