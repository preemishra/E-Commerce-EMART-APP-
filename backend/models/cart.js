
module.exports=(Sequelize,sequelize,DataTypes)=>{
    const Cart = sequelize.define('carts', {
     cart_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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
        tableName: 'carts',
        timestamps: true,
    });
    return Cart;
    }