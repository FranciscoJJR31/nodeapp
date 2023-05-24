
const express = require('express')
const os = require('os')
const Pool = require('pg').Pool
const bodyParser = require('body-parser')
const moment = require('moment');
const nodemailer = require('nodemailer');
const Horaformat =  'HH:mm:ss';
const Fechaformat =  'YYYY-MM-DD';
//const WebSocket = require("ws").Server; 

const pool = new Pool({
  user: 'appuser',
  host: 'postgres',
 // host: '10.0.0.94', 
  database: 'appdb',
  password: 'strongpasswordapp',
  port: 5432,
})
const app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

/*const wss = new WebSocket.Server({ port: 4000 }); 
wss.on("connection", (ws, request) => { const clientIp = request.connection.remoteAddress;
  console.log(`[WebSocket] Client with IP ${clientIp} has connected`); 
  ws.send("Thanks for connecting to this nodejs websocket server"); 
  // Broadcast aka send messages to all connected clients 
  ws.on("message", (message) => { wss.clients.forEach((client) => { if (client.readyState === WebSocket.OPEN) { client.send(message); } }); 
  console.log(`[WebSocket] Message ${message} was received`); }); });
*/

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: 'franciscojavier.31897@gmail.com',
      pass: 'pgcpqoehanughxnn'
  }
});

pool.connect((err, client, done)=>{
if(err){
 console.log("Database ERROR")
}else{
  console.log("Database conected")
  client.on('notification', (msg) =>{
    // ponemos el string de salida en JSON
    const obj = JSON.parse(msg.payload);
    let agresor;
    let nombre_agresor;
   // Envio de alerta a EMAIL
   pool
  .query('SELECT * FROM orden where id_orden = $1',[ obj['id_orden'] ])
  .then((res) => {
    pool
    .query("select * from agresor where id_agresor = $1",[ res.rows[0]['id_agresor']  ])
    .then((res) => {
      agresor=res.rows[0]['id_agresor']
      nombre_agresor= `${res.rows[0]['p_nombre']} ${res.rows[0]['s_nombre']||" "} ${res.rows[0]['p_apellido']} ${res.rows[0]['s_apellido']||" "}`
      pool
      .query("select * from ubicacion_agresor where id_agresor = $1 order by id_ubicacion_agresor DESC LIMIT 1;",[ agresor ])
      .then((res) => {
        // inicia el envio de datos via EMAIL
              
const mailOptions = {
  from: `franciscojavier.31897@gmail.com`,
  to: 'julio.grullon0418@live.com',
  subject: 'Notificacion De Alerta!',
  html: '<h1>Alerta De Violacion De Seguridad Banda</h1><p>Datos sobre la orden de alejamiento!</p>',
attachments: [{
filename: 'orden.json',
content: `{"numero de orden":"${obj['id_orden']}",
          "Agresor":{
            "Nombre Completo":"${nombre_agresor}",
            "Ultima Posicion Reciente":"${res.rows[0]['longitud']||"0"},${res.rows[0]['latitud']||"0"}",
            "Ultima Hora y Fecha Reciente":"${res.rows[0]['hora']||"0"},${res.rows[0]['fecha']||"0"}"
          }
          }`
}]
};   
transporter.sendMail(mailOptions, (error, data) => {
if (error) {
    console.log(error)
    
      }

console.log("Correo enviado");
});

        
      }) 
      .catch((err) => {response.status(404).json("La agresor no existe")})
      
    }) 
    .catch((err) => {response.status(404).json("La agresor no existe")})
    
  }) 
  .catch((err) => {response.status(404).json("La orden no existe")})
  
  });
//Agregamos posicion agresor notificacion



  
  const query = client.query("LISTEN update_notification")
 
}
});

pool.connect((err, client, done)=>{
  if(err){
   console.log("Database ERROR")
  }else{
    console.log("Database conected2")

  //Agregamos posicion agresor notificacion

  client.on('notification', (msg) =>{
    // ponemos el string de salida en JSON
    const obj = JSON.parse(msg.payload);
    let agresor,orden_id;
    let nombre_agresor,nombre_victima,victima,distanciaProhibida;
    let UltimaPosAgresor, UltimaHoraFechaAgresor,latVictima,latAgresor, lonAgresor, lonVictima;

    
   // Envio de alerta a EMAIL
   pool
  .query('SELECT * FROM orden where id_agresor = $1',[ obj['id_agresor'] ])
  .then((res) => {
    victima=res.rows[0]['id_victima']
    orden_id=res.rows[0]['id_orden']
    
    distanciaProhibida=res.rows[0]['distancia_prohibida']
  
    pool
    .query("select * from agresor where id_agresor = $1",[ res.rows[0]['id_agresor']  ])
    .then((res) => {
      agresor=res.rows[0]['id_agresor']
      
      nombre_agresor= `${res.rows[0]['p_nombre']} ${res.rows[0]['s_nombre']||" "} ${res.rows[0]['p_apellido']} ${res.rows[0]['s_apellido']||" "}`
      pool
      .query("select * from ubicacion_agresor where id_agresor = $1 order by id_ubicacion_agresor DESC LIMIT 1;",[ agresor ])
      .then((res) => {
        // inicia el envio de datos via EMAIL
        UltimaHoraFechaAgresor=`${res.rows[0]['hora']||"0"},${res.rows[0]['fecha']||"0"}` 
        UltimaPosAgresor=`${res.rows[0]['longitud']||"0"},${res.rows[0]['latitud']||"0"}`     
        latAgresor=`${res.rows[0]['latitud']||"0"}`
        lonAgresor=`${res.rows[0]['longitud']||"0"}`
        pool
        .query("select * from victima where id_victima = $1",[ victima ])
        .then((res) => {
          nombre_victima= `${res.rows[0]['p_nombre']} ${res.rows[0]['s_nombre']||" "} ${res.rows[0]['p_apellido']} ${res.rows[0]['s_apellido']||" "}`
          pool
          .query("select * from ubicacion_victima where id_victima = $1 order by id_ubicacion_victima DESC LIMIT 1;",[ victima ])
          .then((res) => {
            // inicia el envio de datos via EMAIL
            latVictima=`${res.rows[0]['latitud']||"0"}`
            lonVictima=`${res.rows[0]['longitud']||"0"}`
             
            const mailOptions = {
              from: `franciscojavier.31897@gmail.com`,
              to: 'julio.grullon0418@live.com',
              subject: 'Notificacion De Alerta!',
              html: '<h1>Alerta De Violacion De Distanciamiento</h1><p>Datos sobre la orden de alejamiento!</p>',
              attachments: [{
              filename: 'orden.json',
              content: `{"numero de orden":"${orden_id}",
                      "Agresor":{
                        "Nombre Completo":"${nombre_agresor}",
                        "Ultima Posicion Reciente":"${UltimaPosAgresor}",
                        "Ultima Hora y Fecha Reciente":"${UltimaHoraFechaAgresor}"
                      },
                      "Victima":{
                        "Nombre Completo":"${nombre_victima}",
                        "Ultima Posicion Reciente":"${res.rows[0]['longitud']||"0"},${res.rows[0]['latitud']||"0"}",
                        "Ultima Hora y Fecha Reciente":"${res.rows[0]['hora']||"0"},${res.rows[0]['fecha']||"0"}"
                      }
                      }`
              }]
              };   

              function distance(lat1, lon1, lat2, lon2, unit) {
                if ((lat1 == lat2) && (lon1 == lon2)) {
                  return 0;
                }
                else {
                  var radlat1 = Math.PI * lat1/180;
                  var radlat2 = Math.PI * lat2/180;
                  var theta = lon1-lon2;
                  var radtheta = Math.PI * theta/180;
                  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                  if (dist > 1) {
                    dist = 1;
                  }
                  dist = Math.acos(dist);
                  dist = dist * 180/Math.PI;
                  dist = dist * 60 * 1.1515;
                  if (unit=="K") { dist = dist * 1.609344 *1000}
                  if (unit=="N") { dist = dist * 0.8684 }
                  return dist;
                }}

                console.log("DISTANCIA: "+distance(latAgresor,lonAgresor,latVictima,lonVictima,"K"));
              if(distance(latAgresor,lonAgresor,latVictima,lonVictima,"K")<=distanciaProhibida){ 
              transporter.sendMail(mailOptions, (error, data) => {
              if (error) {
                console.log(error)
                
                  }
              
              console.log("Correo enviado2");
              });}else{
                console.log("DISTANCIA MAYOR A LA RESTIDA:"+distance(latAgresor,lonAgresor,latVictima,lonVictima,"K"));

              }
    
     
        
    
      
            
          }) 
          .catch((err) => {response.status(404).json("La victima no existe")})
          
    
          
     
      
  
    
          
        }) 
        .catch((err) => {response.status(404).json("La agresor no existe")})
   
    

  
        
      }) 
      .catch((err) => {response.status(404).json("La agresor no existe")})
      
    }) 
    .catch((err) => {response.status(404).json("La agresor no existe")})
    
  }) 
  .catch((err) => {response.status(404).json("La orden no existe")})
  
  });
  
  //Fin Agregamos posicion agresor notification
  
  
  
    
    
    const query2 = client.query("LISTEN update_posicion_agresor")
  }
  });







app.get('/agregaragresor', async (request, response) => {
  let id_agresor= request.query.id_agresor
 
  pool
    .query('SELECT * FROM agresor where id_agresor = $1',[ id_agresor ])
    .then(async (res) => {
    
     
      //pool.query("insert into ubicacion_agresor (id_agresor,longitud,latitud,fecha,hora) values ($1,$2,$3,$4,$5)",[ id_agresor, longitud, latitud, fecha, hora  ])
      

      if(res.rowCount=="0"){
        pool.query("insert into agresor (id_agresor) values ($1)",[ id_agresor ])
        response.status(200).json("Grillete OK")
      }else{
         response.status(404).json("Grillete Existe en la DB")
      }
       
    }) 
    .catch((err) => {

      
      response.status(404).json("Error")
    
    
    })
  
  })


app.get('/agresorposicion', async (request, response) => {
let id_agresor= request.query.id_agresor
const id_orden = ''
const latitud = request.query.lat;
const longitud = request.query.lon;
pool
  .query('SELECT * FROM orden where id_agresor = $1',[ id_agresor ])
  .then((res) => {
    
    id_agresor= res.rows[0]['id_agresor']
    const hora = moment().format(Horaformat)
    const fecha = moment().format(Fechaformat)
    pool.query("insert into ubicacion_agresor (id_agresor,longitud,latitud,fecha,hora) values ($1,$2,$3,$4,$5)",[ id_agresor, longitud, latitud, fecha, hora  ])
    response.status(200).json("posicion agregada")
  }) 
  .catch((err) => {response.status(404).json("La orden no existe")})

})

app.get('/estadobanda', async (request, response) => {
  const id_orden = request.query.id_orden
  const estado = request.query.estado
  pool
    .query('SELECT * FROM orden where id_orden = $1',[ id_orden ])
    .then((res) => {
      
      id_agresor= res.rows[0]['id_agresor']
      pool.query("update  control_alertas set estado = $1 where id_orden = $2 ",[  estado, id_orden  ])
      response.status(200).json("modo actualizado")
    }) 
    .catch((err) => {response.status(404).json("La orden no existe")})
  
})

app.get('/deshabilitarcuenta', async (request, response) => {
  const id_victima = request.query.id_victima;
    pool
      .query('SELECT * FROM victima where id_victima = $1',[ id_victima ])
      .then((res) => {
        pool.query("update  victima set login = 'false' where id_victima = $1 ",[ id_victima ])
        response.status(200).json("login actualizado")
      }) 
      .catch((err) => {response.status(404).json("La orden no existe")})
    
})
app.get('/habilitarcuenta', async (request, response) => {
      const id_victima = request.query.id_victima;
        pool
          .query('SELECT * FROM victima where id_victima = $1',[ id_victima ])
          .then((res) => {
            pool.query("update  victima set login = 'true' where id_victima = $1 ",[ id_victima ])
            response.status(200).json("login actualizado")
          }) 
          .catch((err) => {response.status(404).json("La orden no existe")})
        
})


const port = 3000
app.listen(port, () => console.log(`listening on port ${port}`))




