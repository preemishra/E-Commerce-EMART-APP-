module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define("addresses",{
      address_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apartment: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      landmark: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
        state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pin_code: {
        type: DataTypes.CHAR(6 ),
        allowNull: false,
      },
      address_type: {
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
    },
    {
      tableName: "addresses",
      timestamps: false,
    }
  );

  return Address;
};
