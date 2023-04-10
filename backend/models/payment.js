
module.exports=(sequelize,DataTypes)=>{
    const Payment = sequelize.define('payment', {
    payment_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      pay_method:{
        type:  DataTypes.ENUM('Cash On Delivery','Online'),
        defaultValue: "Cash On Delivery",
      },
      total_amount: {
        type: DataTypes.DECIMAL  ,
        allowNull: false
      },
      payment_status:{
        type:  DataTypes.ENUM('Success','Failed','In Progress'),
        defaultValue: "In Progress",
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
        tableName: 'payment',
        timestamps: true,
    });
    return Payment;
    }