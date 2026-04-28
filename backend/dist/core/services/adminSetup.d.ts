/**
 * Crea el usuario administrador si no existe.
 * Las credenciales se leen desde las variables de entorno ADMIN_USERNAME y ADMIN_PASSWORD.
 * Se ejecuta una sola vez al arrancar el servidor.
 */
export declare function crearAdminSiNoExiste(): Promise<void>;
