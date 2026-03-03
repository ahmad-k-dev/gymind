using GYMIND.API.Interfaces;
using GYMIND.API.Service;
using GYMIND.API.Services;
using GYMIND.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.WebHost.UseUrls("http://0.0.0.0:7179");
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<DatabaseConnection>();

builder.Services.AddDbContext<SupabaseDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Supabase"),
        npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure();
        });
});

// jwt authentication configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = "GYMIND",
            ValidateAudience = true,
            ValidAudience = "GYMINDUsers",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() // For development only!
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



// Register Controllers
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });




// supabase client configuration
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];

builder.Services.AddScoped(_ => new Supabase.Client(supabaseUrl, supabaseKey));



//Register Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IGymService, GymService>();
builder.Services.AddScoped<IMembershipService, MembershipService>();
builder.Services.AddScoped<IGymSessionService, GymSessionService>();
builder.Services.AddHttpContextAccessor(); //Because inside NotificationService we use:  _httpContextAccessor.HttpContext.User
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();


// Swagger/OpenAPI configuration






var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

}


app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
