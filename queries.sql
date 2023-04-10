------------------------------Tables-------------------------------------
--users table
emart=# select * from users;
 user_id |   full_name   |       email       |     pwd      |  role  | user_status | created_by |         created_on         | updated_by |         updated_on
---------+---------------+-------------------+--------------+--------+-------------+------------+----------------------------+------------+----------------------------
       1 | Preeti Mishra | preetim@indx.ai   | Preeti@123   | Admin  | True        | Preeti     | 2023-03-24 14:50:48.728456 | Preeti     | 2023-03-24 14:50:48.728456
       2 | Kuladip Magar | kuldip111@indx.ai | Pass@123     | User   | True        | Kuladip    | 2023-03-24 14:50:48.728456 | Kuladip    | 2023-03-24 14:50:48.728456
       3 | Root Alen     | root12@indx.ai    | RootAlen@123 | User   | True        | Root       | 2023-03-24 14:50:48.728456 | Root       | 2023-03-24 14:50:48.728456
       4 | Rohit Nale    | rohitnale@indx.ai | Rohit12@123  | User   | True        | Rohit      | 2023-03-24 14:50:48.728456 | Nale       | 2023-03-24 17:22:47.386161
       5 | John Doe      | johndoe@indx.ai   | JohnDoe@123  | Seller | True        | John       | 2023-03-24 14:50:48.728456 | John       | 2023-03-24 17:22:47.390263
       6 | Ankit Bisht   | ankit@indx.ai     | Ankit1@123   | Seller | True        | Ankit      | 2023-03-24 14:50:48.728456 | Ankit      | 2023-03-24 17:22:47.391235
(6 rows)

--addresses table
emart=# select * from addresses;
 address_id | user_id |   apartment    |    street     |    landmark    |  city  |    state    | pin_code | address_type | created_by |         created_on         | updated_by |         updated_on
------------+---------+----------------+---------------+----------------+--------+-------------+----------+--------------+------------+----------------------------+------------+----------------------------
          1 |       1 | Panchvati      | A B C         | P D School     | Pune   | Maharashtra | 400516   | Home         | Preeti     | 2023-03-24 14:53:23.135288 | Preeti     | 2023-03-24 14:53:23.135288
          2 |       2 | Ganag Vihar    | Fountain Road | S M shetty     | Mumbai | Maharashtra | 400116   | Home         | Kuladip    | 2023-03-24 14:53:23.135288 | Kuladip    | 2023-03-24 14:53:23.135288
          3 |       3 | Nalanda Vihar  | High Street   | mnc            | Mumbai | Maharashtra | 400111   | Home         | Root       | 2023-03-24 14:53:23.135288 | Root       | 2023-03-24 14:53:23.135288
          4 |       4 | Trimurti Vihar | SBP Road      | Old Street     | Mumbai | Maharashtra | 400112   | Home         | Rohit      | 2023-03-24 14:53:23.135288 | Rohit      | 2023-03-24 14:53:23.135288
          5 |       5 | S T Block A    | Trinity Road  | Fashion Street | Mumbai | Maharashtra | 400116   | Office       | John       | 2023-03-24 14:53:23.135288 | John       | 2023-03-24 14:53:23.135288
          6 |       6 | Wing Block B   | MIDC Road     | World Trade    | Mumbai | Maharashtra | 400116   | Office       | Ankit      | 2023-03-24 14:53:23.135288 | Ankit      | 2023-03-24 14:53:23.135288
(6 rows)

--products table
emart=# select * from products;
 product_id | user_id |                product_name                 |                                       descriptions                                       | price | product_qty | picture | created_by |         created_on         | updated_by |         updated_on 
------------+---------+---------------------------------------------+------------------------------------------------------------------------------------------+-------+-------------+---------+------------+----------------------------+------------+----------------------------
          2 |       5 | Mobile POCO X5 Pro 5G                       | 8 GB RAM | 256 GB ROM 16.94 cm (6.67 inch) Full HD+ Display                             +| 15000 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 14:56:41.355307
            |         |                                             | 108MP + 8MP + 2MP | 16MP Front Camera5000 mAh Battery Qualcomm Snapdragon 778G Processor |       |             |         |            |                            |            |
          3 |       6 | Laptop ASUS TUF Gaming F15 Core i5 10th Gen | 8 GB/512 GB SSD/Windows 11 Home/4 GB Graphics/NVIDIA GeForce GTX 1650/144 Hz)           +| 99999 |           5 | url     | Ankit      | 2023-03-24 14:56:41.355307 | Ankit      | 2023-03-24 14:56:41.355307
            |         |                                             |  FX506LHB-HN358W Gaming Laptop  (15.6 inch, Black Plastic, 2.30 kg kg                    |       |             |         |            |                            |            |
          1 |       5 | Mobile REDMI 10                             | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display               +|  9999 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 15:51:48.83108
            |         |                                             | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery                          +|       |             |         |            |                            |            |
            |         |                                             | Qualcomm Snapdragon 680 Processor                                                        |       |             |         |            |                            |            |
(3 rows)

--cart table
emart=# select * from carts;
 cart_id | user_id | created_by |         created_on         | updated_by |         updated_on
---------+---------+------------+----------------------------+------------+----------------------------
       1 |       2 | Kuladip    | 2023-03-24 15:00:44.861513 | Kuladip    | 2023-03-24 15:00:44.861513
(1 row)

--cart_details table
emart=# select * from cart_details;
 cart_details_id | cart_id | product_id | cart_product_qty | unit_price | created_by |         created_on         | updated_by |         updated_on
-----------------+---------+------------+------------------+------------+------------+----------------------------+------------+----------------------------
               1 |       1 |          1 |                2 |      19998 | Kuladip    | 2023-03-24 15:18:32.093023 | Kuladip    | 2023-03-24 15:18:32.093023
               2 |       1 |          2 |                1 |      15000 | Kuladip    | 2023-03-24 15:18:32.093023 | Kuladip    | 2023-03-24 15:18:32.093023
(2 rows)

--orders table
emart=# select * from orders;
 order_id | user_id | created_by |         created_on         | updated_by |         updated_on
----------+---------+------------+----------------------------+------------+----------------------------
        1 |       2 | Kuladip    | 2023-03-24 15:20:55.085923 | Kuladip    | 2023-03-24 15:20:55.085923
(1 row)


--order_details table
emart=# select * from order_details;
 order_details_id | order_id | address_id | product_id | ordered_qty | unit_price | order_status | created_by |         created_on         | updated_by |         updated_on
------------------+----------+------------+------------+-------------+------------+--------------+------------+----------------------------+------------+----------------------------
                1 |        1 |          2 |          1 |           2 |      19998 | In Process   | Kuldip     | 2023-03-24 15:25:11.300796 | Kuldip     | 2023-03-24 15:25:11.300796
                2 |        1 |          2 |          2 |           1 |      15000 | In Process   | Kuldip     | 2023-03-24 15:25:11.300796 | Kuldip     | 2023-03-24 15:25:11.300796
(2 rows)

--payment table
emart=# select * from payment;
 payment_id | order_id |  payment_method  | total_amount | payment_status | created_by |         created_on         | updated_by |         updated_on
------------+----------+------------------+--------------+----------------+------------+----------------------------+------------+----------------------------
          1 |        1 | Cash On Delivery |        34998 | In Progress    | Kuladip    | 2023-03-24 15:28:33.113093 | Kuladip    | 2023-03-24 15:31:59.725978
(1 row)




------------------------------Queries-------------------------------------

emart=# select * from products where user_id=5;
Output:
 product_id | user_id |     product_name      |                                       descriptions                                       | price | product_qty | picture | created_by |         created_on         | updated_by |         updated_on
------------+---------+-----------------------+------------------------------------------------------------------------------------------+-------+-------------+---------+------------+----------------------------+------------+----------------------------
          1 |       5 | Mobile REDMI 10       | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display               +| 99999 |          10 | url     | John       | 2023-03-24 15:36:49.373426 | John       | 2023-03-24 15:36:49.373426
            |         |                       | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery                          +|       |             |         |            |                            |            |
            |         |                       | Qualcomm Snapdragon 680 Processor                                                        |       |             |         |            |                            |            |
          2 |       5 | Mobile POCO X5 Pro 5G | 8 GB RAM | 256 GB ROM 16.94 cm (6.67 inch) Full HD+ Display                             +| 15000 |          10 | url     | John       | 2023-03-24 15:36:49.373426 | John       | 2023-03-24 15:36:49.373426
            |         |                       | 108MP + 8MP + 2MP | 16MP Front Camera5000 mAh Battery Qualcomm Snapdragon 778G Processor |       |             |         |            |                            |            |
(2 rows)

--view all the products
emart=# select * from products;
 product_id | user_id |                product_name                 |                                       descriptions                                       | price | product_qty | picture | created_by |         created_on         | updated_by |         updated_on 
------------+---------+---------------------------------------------+------------------------------------------------------------------------------------------+-------+-------------+---------+------------+----------------------------+------------+----------------------------
          2 |       5 | Mobile POCO X5 Pro 5G                       | 8 GB RAM | 256 GB ROM 16.94 cm (6.67 inch) Full HD+ Display                             +| 15000 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 14:56:41.355307
            |         |                                             | 108MP + 8MP + 2MP | 16MP Front Camera5000 mAh Battery Qualcomm Snapdragon 778G Processor |       |             |         |            |                            |            |
          3 |       6 | Laptop ASUS TUF Gaming F15 Core i5 10th Gen | 8 GB/512 GB SSD/Windows 11 Home/4 GB Graphics/NVIDIA GeForce GTX 1650/144 Hz)           +| 99999 |           5 | url     | Ankit      | 2023-03-24 14:56:41.355307 | Ankit      | 2023-03-24 14:56:41.355307
            |         |                                             |  FX506LHB-HN358W Gaming Laptop  (15.6 inch, Black Plastic, 2.30 kg kg                    |       |             |         |            |                            |            |
          1 |       5 | Mobile REDMI 10                             | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display               +|  9999 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 15:51:48.83108
            |         |                                             | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery                          +|       |             |         |            |                            |            |
            |         |                                             | Qualcomm Snapdragon 680 Processor                                                        |       |             |         |            |                            |            |
(3 rows)
 

-- view single product
emart=# select * from products where product_id='1';
 product_id | user_id |  product_name   |                               descriptions                                | price | product_qty | picture | created_by |         created_on         | updated_by |        updated_on
------------+---------+-----------------+---------------------------------------------------------------------------+-------+-------------+---------+------------+----------------------------+------------+---------------------------
          1 |       5 | Mobile REDMI 10 | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display+|  9999 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 15:51:48.83108
            |         |                 | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery           +|       |             |         |            |                            |            |
            |         |                 | Qualcomm Snapdragon 680 Processor                                         |       |             |         |            |                            |            |
(1 row)

--search product based on product name
emart=# select * from products where product_name ilike '%Mobile%';
 product_id | user_id |     product_name      |                                       descriptions                                       | price | product_qty | picture | created_by |         created_on         | updated_by |         updated_on
------------+---------+-----------------------+------------------------------------------------------------------------------------------+-------+-------------+---------+------------+----------------------------+------------+----------------------------
          2 |       5 | Mobile POCO X5 Pro 5G | 8 GB RAM | 256 GB ROM 16.94 cm (6.67 inch) Full HD+ Display                             +| 15000 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 14:56:41.355307
            |         |                       | 108MP + 8MP + 2MP | 16MP Front Camera5000 mAh Battery Qualcomm Snapdragon 778G Processor |       |             |         |            |                            |            |
          1 |       5 | Mobile REDMI 10       | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display               +|  9999 |          10 | url     | John       | 2023-03-24 14:56:41.355307 | John       | 2023-03-24 15:51:48.83108
            |         |                       | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery                          +|       |             |         |            |                            |            |
            |         |                       | Qualcomm Snapdragon 680 Processor                                                        |       |             |         |            |                            |            |
(2 rows)

--view users cart
emart=# select product_name,descriptions,price,picture,cart_product_qty,unit_price from users inner join carts on users.user_id=carts.user_id inner join cart_details on carts.cart_id=cart_details.cart_id inner join products on products.product_id=cart_details.product_id where users.user_id='2';
     product_name      |                                       descriptions                                       | price | picture | cart_product_qty | unit_price
-----------------------+------------------------------------------------------------------------------------------+-------+---------+------------------+------------
 Mobile REDMI 10       | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display               +|  9999 | url     |                2 |      19998
                       | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery                          +|       |         |                  |
                       | Qualcomm Snapdragon 680 Processor                                                        |       |         |                  |
 Mobile POCO X5 Pro 5G | 8 GB RAM | 256 GB ROM 16.94 cm (6.67 inch) Full HD+ Display                             +| 15000 | url     |                1 |      15000
                       | 108MP + 8MP + 2MP | 16MP Front Camera5000 mAh Battery Qualcomm Snapdragon 778G Processor |       |         |                  |
(2 rows)


--login for seller/user/admin
emart=# select email,pwd from users where email='ankit@indx.ai' ;
     email     |    pwd
---------------+------------
 ankit@indx.ai | Ankit1@123
(1 row)

--user saved address
emart=# select * from addresses where user_id='2';
 address_id | user_id |  apartment  |    street     |  landmark  |  city  |    state    | pin_code | address_type | created_by |         created_on         | updated_by |         updated_on
------------+---------+-------------+---------------+------------+--------+-------------+----------+--------------+------------+----------------------------+------------+----------------------------
          2 |       2 | Ganag Vihar | Fountain Road | S M shetty | Mumbai | Maharashtra | 400116   | Home         | Kuladip    | 2023-03-24 14:53:23.135288 | Kuladip    | 2023-03-24 14:53:23.135288
(1 row)
--user saved address based on type
emart=# select * from addresses where user_id='2' and address_type='Home';
 address_id | user_id |  apartment  |    street     |  landmark  |  city  |    state    | pin_code | address_type | created_by |         created_on         | updated_by |         updated_on
------------+---------+-------------+---------------+------------+--------+-------------+----------+--------------+------------+----------------------------+------------+----------------------------
          2 |       2 | Ganag Vihar | Fountain Road | S M shetty | Mumbai | Maharashtra | 400116   | Home         | Kuladip    | 2023-03-24 14:53:23.135288 | Kuladip    | 2023-03-24 14:53:23.135288
(1 row)

--user latest used address
emart=# select * from addresses where user_id='2' and created_on > (select current_date);
 address_id | user_id |  apartment  |    street     |  landmark  |  city  |    state    | pin_code | address_type | created_by |         created_on         | updated_by |         updated_on
------------+---------+-------------+---------------+------------+--------+-------------+----------+--------------+------------+----------------------------+------------+----------------------------
          2 |       2 | Ganag Vihar | Fountain Road | S M shetty | Mumbai | Maharashtra | 400116   | Home         | Kuladip    | 2023-03-24 14:53:23.135288 | Kuladip    | 2023-03-24 14:53:23.135288
(1 row)

--user orders
emart=# select product_name,descriptions,order_status,picture,'order_id' from users inner join orders on users.user_id=orders.user_id inner join order_details on orders.order_id=order_details.order_id inner join products on order_details.product_id=products.product_id where users.user_id='2';
     product_name      |                                       descriptions                                       | order_status | picture | ?column?
-----------------------+------------------------------------------------------------------------------------------+--------------+---------+----------
 Mobile REDMI 10       | 4 GB RAM | 64 GB ROM Expandable Upto 1 TB 17.02 cm (6.7 inch) HD+ Display               +| In Process   | url     | order_id
                       | 50MP + 2MP | 5MP Front Camera60 00 mAh Lithium Polymer Battery                          +|              |         |
                       | Qualcomm Snapdragon 680 Processor                                                        |              |         |
 Mobile POCO X5 Pro 5G | 8 GB RAM | 256 GB ROM 16.94 cm (6.67 inch) Full HD+ Display                             +| In Process   | url     | order_id
                       | 108MP + 8MP + 2MP | 16MP Front Camera5000 mAh Battery Qualcomm Snapdragon 778G Processor |              |         |
(2 rows)

