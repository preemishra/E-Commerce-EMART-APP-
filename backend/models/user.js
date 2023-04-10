
module.exports=(sequelize,DataTypes)=>{
const User = sequelize.define('users', {
 user_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING,
     allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
    isEmail: true
  }
  },
  pwd: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role:{
    type:  DataTypes.ENUM('User','Admin','Seller'),
    defaultValue: "User",
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
    tableName: 'users',
    timestamps: false,
  
});
return User;
}