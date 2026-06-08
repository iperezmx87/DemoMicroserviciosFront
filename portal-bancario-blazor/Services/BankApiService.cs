using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Isra.Demos.Microservicios.PortalBancarioBlazor.DTOs;
using Microsoft.Extensions.Configuration;

namespace Isra.Demos.Microservicios.PortalBancarioBlazor.Services
{
    public class BankApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _usuariosCuentasUrl;
        private readonly string _webApiUrl;
        private readonly string _cuentaMovimientosUrl;

        public BankApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _usuariosCuentasUrl = configuration["Microservices:UsuariosCuentasUrl"]?.TrimEnd('/');
            _webApiUrl = configuration["Microservices:WebApiUrl"]?.TrimEnd('/');
            _cuentaMovimientosUrl = configuration["Microservices:CuentaMovimientosUrl"]?.TrimEnd('/');
        }

        private void SetAuthorizationHeader(string token)
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Realiza el inicio de sesión del usuario.
        /// </summary>
        public async Task<LoginResponseDto> LoginAsync(string usuario, string secreto)
        {
            try
            {
                var request = new LoginRequestDto { Usuario = usuario, Secreto = secreto };
                var response = await _httpClient.PostAsJsonAsync($"{_usuariosCuentasUrl}/api/CuentaUsuario/login", request);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<LoginResponseDto>();
                }

                if (response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.BadRequest)
                {
                    var errorResult = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
                    return errorResult ?? new LoginResponseDto { Success = false, Mensaje = "Credenciales incorrectas" };
                }

                return new LoginResponseDto { Success = false, Mensaje = "Error en el servidor. Inténtalo más tarde." };
            }
            catch (Exception ex)
            {
                return new LoginResponseDto 
                { 
                    Success = false, 
                    Mensaje = "No se pudo conectar con el servicio de autenticación. Verifica que esté activo." 
                };
            }
        }

        /// <summary>
        /// Obtiene el saldo actual de la cuenta.
        /// </summary>
        public async Task<decimal> GetSaldoAsync(Guid cuentaId, string token)
        {
            try
            {
                SetAuthorizationHeader(token);
                var response = await _httpClient.GetAsync($"{_webApiUrl}/api/Cuenta/{cuentaId}/saldo");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("Error al obtener el saldo.");
                }

                // Intentar leer como número decimal directamente
                try
                {
                    var saldoDecimal = await response.Content.ReadFromJsonAsync<decimal>();
                    return saldoDecimal;
                }
                catch (JsonException)
                {
                    // Si el backend retorna un JSON estructurado como { "saldoActual": 120.50 }
                    var doc = await response.Content.ReadFromJsonAsync<JsonElement>();
                    if (doc.TryGetProperty("saldoActual", out var prop))
                    {
                        return prop.GetDecimal();
                    }
                    return 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al consultar saldo: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Obtiene el estado de cuenta y sus movimientos asociados.
        /// </summary>
        public async Task<CuentaDto> GetEstadoCuentaAsync(Guid cuentaId, string token)
        {
            try
            {
                SetAuthorizationHeader(token);
                var response = await _httpClient.GetAsync($"{_webApiUrl}/api/Cuenta/{cuentaId}/estado-cuenta");

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    // Caso en el que no hay movimientos registrados
                    return new CuentaDto
                    {
                        AggregateId = cuentaId,
                        Saldo = 0,
                        Movimientos = Array.Empty<CuentaMovimientoDto>()
                    };
                }

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("Error al obtener el historial de movimientos.");
                }

                return await response.Content.ReadFromJsonAsync<CuentaDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al consultar movimientos: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Descarga el estado de cuenta en formato PDF.
        /// </summary>
        public async Task<byte[]> GetEstadoCuentaPdfAsync(Guid cuentaId, string token)
        {
            try
            {
                SetAuthorizationHeader(token);
                var response = await _httpClient.GetAsync($"{_webApiUrl}/api/Cuenta/{cuentaId}/estado-cuenta-pdf");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("Error al descargar el archivo PDF.");
                }

                return await response.Content.ReadAsByteArrayAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al descargar PDF: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Realiza una transferencia de dinero.
        /// </summary>
        public async Task<(bool Success, string Error)> TransferirAsync(TransferenciaRequestDto request, string token)
        {
            try
            {
                SetAuthorizationHeader(token);
                var response = await _httpClient.PostAsJsonAsync($"{_cuentaMovimientosUrl}/api/Cuentas/transferir", request);

                if (response.IsSuccessStatusCode)
                {
                    return (true, null);
                }

                // Intentar leer el mensaje de error del backend
                try
                {
                    var doc = await response.Content.ReadFromJsonAsync<JsonElement>();
                    if (doc.TryGetProperty("error", out var prop))
                    {
                        return (false, prop.GetString());
                    }
                    if (doc.TryGetProperty("mensaje", out var msg))
                    {
                        return (false, msg.GetString());
                    }
                }
                catch { }

                return (false, $"Error al realizar la transferencia ({response.StatusCode}).");
            }
            catch (Exception ex)
            {
                return (false, "Error de conexión. Verifica que el microservicio de movimientos esté encendido.");
            }
        }
    }
}
