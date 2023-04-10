const {Sequelize,DataTypes} = require("sequelize");
const config=require('../config/dbConfig')
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  logging:false,
});
try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

const db={}
db.Sequelize=Sequelize
db.sequelize=sequelize
db.address=require('./address')(sequelize,DataTypes)
db.cart=require('./cart')(Sequelize,sequelize,DataTypes)
db.cartDetail=require('./cartDetail')(sequelize,DataTypes)
db.order=require('./order')(sequelize,DataTypes)
db.orderDetail=require('./orderDetail')(sequelize,DataTypes)
db.payment=require('./payment')(sequelize,DataTypes)
db.product=require('./product')(sequelize,DataTypes)
db.user=require('./user')(sequelize,DataTypes)

db.user.hasOne(db.address,{
  foreignKey:  "user_id"
});
db.user.hasOne(db.product,{
  foreignKey:  "user_id"
  });
db.user.hasOne(db.cart,{
  foreignKey:  "user_id"
  });
  db.user.hasMany(db.order,{
    foreignKey:  "user_id"
    });

  db.cart.hasMany(db.cartDetail,{
    foreignKey:  "cart_id"
  });
  db.order.hasMany(db.orderDetail,{
    foreignKey:  "order_id"
  });


  db.cartDetail.belongsTo(db.cart,{foreignKey: 'cart_id'});
  // db.cartDetail.belongsTo(db.user,{foreignKey: 'user_id'});
  db.cartDetail.belongsTo(db.product,{foreignKey: 'product_id'});
  db.orderDetail.belongsTo(db.order,{foreignKey: 'order_id'});
  db.orderDetail.belongsTo(db.product,{foreignKey: 'product_id'});
  db.orderDetail.belongsTo(db.address,{foreignKey: 'address_id'});
  // db.order.belongsTo(db.user,{
  //   foreignKey:  "order_id"
  // });
 
  db.payment.belongsTo(db.order,{foreignKey: 'order_id'});

db.sequelize.sync({ force: false}).then(()=>{

});
module.exports=db
