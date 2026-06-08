using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Isra.Demos.Microservicios.PortalBancarioBlazor.Services
{
    public class CustomAuthenticationStateProvider : AuthenticationStateProvider
    {
        private readonly ProtectedLocalStorage _localStorage;
        private readonly ClaimsPrincipal _anonymous = new(new ClaimsIdentity());

        public CustomAuthenticationStateProvider(ProtectedLocalStorage localStorage)
        {
            _localStorage = localStorage;
        }

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            try
            {
                var result = await _localStorage.GetAsync<string>("jwt_token");
                if (result.Success && !string.IsNullOrWhiteSpace(result.Value))
                {
                    var token = result.Value;
                    var claims = DecodeJwtClaims(token);

                    // Verificar expiración del token
                    var expClaim = claims.FirstOrDefault(c => c.Type == "exp")?.Value;
                    if (expClaim != null && long.TryParse(expClaim, out var exp))
                    {
                        var expirationTime = DateTimeOffset.FromUnixTimeSeconds(exp);
                        if (expirationTime <= DateTimeOffset.UtcNow)
                        {
                            await MarkUserAsLoggedOutAsync();
                            return new AuthenticationState(_anonymous);
                        }
                    }

                    var identity = new ClaimsIdentity(claims, "jwt");
                    var user = new ClaimsPrincipal(identity);
                    return new AuthenticationState(user);
                }
            }
            catch
            {
                // ProtectedLocalStorage fallará durante la pre-renderización estática inicial en el servidor
                return new AuthenticationState(_anonymous);
            }

            return new AuthenticationState(_anonymous);
        }

        public async Task MarkUserAsAuthenticatedAsync(string token)
        {
            await _localStorage.SetAsync("jwt_token", token);
            var claims = DecodeJwtClaims(token);
            var identity = new ClaimsIdentity(claims, "jwt");
            var user = new ClaimsPrincipal(identity);

            NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(user)));
        }

        public async Task MarkUserAsLoggedOutAsync()
        {
            try
            {
                await _localStorage.DeleteAsync("jwt_token");
            }
            catch
            {
                // Ignorar excepciones al intentar eliminar durante pre-render
            }
            
            NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(_anonymous)));
        }

        public async Task<string> GetTokenAsync()
        {
            try
            {
                var result = await _localStorage.GetAsync<string>("jwt_token");
                return result.Success ? result.Value : null;
            }
            catch
            {
                return null;
            }
        }

        private IEnumerable<Claim> DecodeJwtClaims(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
            {
                return Enumerable.Empty<Claim>();
            }

            var jwtToken = handler.ReadJwtToken(token);
            return jwtToken.Claims;
        }
    }
}
