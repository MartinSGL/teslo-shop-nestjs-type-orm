<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clonar proyecto
2. Ejecutar el comando
```
yarn install
```
3. Clonar el archivo __.env.template__ y renombarlo a __.env__
4. Poner las variables de entorno
5. Levantar la base de datos
```
  docker-compose up -d
```
6. Levantar el proyecto
```
yarn start:dev
```
7. Ejecutar el seed
```
http://localhost:3000/api/v2/seed
```

- TSconfig "tasger" fue modificado para que se pueda utilizar el replaceAll es2017 - ES2021
- checar el eager loading para el findbyid
- checar el logger para mandar mejores mensajes a la consola