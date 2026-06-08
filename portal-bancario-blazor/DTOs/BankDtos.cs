using System;

namespace Isra.Demos.Microservicios.PortalBancarioBlazor.DTOs
{
    /// <summary>
    /// Credenciales para iniciar sesión.
    /// </summary>
    public class LoginRequestDto
    {
        public string Usuario { get; set; }
        public string Secreto { get; set; }
    }

    /// <summary>
    /// Respuesta del inicio de sesión.
    /// </summary>
    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public string Mensaje { get; set; }
    }

    /// <summary>
    /// Resumen de la cuenta bancaria.
    /// </summary>
    public class CuentaDto
    {
        public Guid AggregateId { get; set; }
        public string Propietario { get; set; }
        public decimal Saldo { get; set; }
        public CuentaMovimientoDto[] Movimientos { get; set; }
    }

    /// <summary>
    /// Detalle de un movimiento bancario.
    /// </summary>
    public class CuentaMovimientoDto
    {
        public decimal Monto { get; set; }
        public string TipoMovimiento { get; set; }
        public DateTimeOffset FechaEvento { get; set; }
        public string Propietario { get; set; }
    }

    /// <summary>
    /// Solicitud de transferencia monetaria.
    /// </summary>
    public class TransferenciaRequestDto
    {
        public Guid CuentaOrigenId { get; set; }
        public Guid CuentaDestinoId { get; set; }
        public decimal Monto { get; set; }
        public string PropietarioOrigen { get; set; }
        public string PropietarioDestino { get; set; }
    }
}
