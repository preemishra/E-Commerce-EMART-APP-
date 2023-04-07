
module.exports=(sequelize,DataTypes)=>{
    const OrderDetail = sequelize.define('order_details', {
     order_details_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      ordered_qty: {
        type: DataTypes.INTEGER  ,
        allowNull: false
      },
      unit_price: {
        type: DataTypes.DECIMAL  ,
        allowNull: false
      },
      order_status:{
        type:  DataTypes.ENUM('In Process','Placed','Shipped','Delivered','Cancelled'),
        defaultValue: "In Process",
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
        tableName: 'order_details',
        timestamps: true,
    });
    return OrderDetail;
    }