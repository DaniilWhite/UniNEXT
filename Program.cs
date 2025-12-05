using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.AI;
using OpenAI.Chat;

var builder = WebApplication.CreateBuilder(args);

// Добавляем поддержку CORS, чтобы HTML мог обращаться с фронта
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("AllowAll");

// Эндпоинт для GPT
app.MapPost("/ask-gpt", async (AskRequest request) =>
{
    string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    if (string.IsNullOrEmpty(apiKey))
        return Results.Problem("API Key не найден!");

    string model = "gpt-4o-mini";
    IChatClient client = new ChatClient(model, apiKey).AsIChatClient();

    string systemMessage = "Ты помощник по информации о университетах Казахстана. Отвечай кратко и с ссылками, если нужно.";

    ChatResponse response = await client.GetResponseAsync($"{systemMessage}\nВопрос: {request.Question}");

    return Results.Json(new { answer = response.Text });
});

app.Run();

record AskRequest(string Question);
