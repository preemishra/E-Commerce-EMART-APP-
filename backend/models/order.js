
module.exports=(sequelize,DataTypes)=>{
    const Order = sequelize.define('orders', {
     order_id:{
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
        tableName: 'orders',
        timestamps: true,
    });
    return Order;
    }