using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Data.Common;
using System.Dynamic;

namespace Domain.Data;

public static class DbContextExtensions
{
    public static async Task<IEnumerable<dynamic>> ExecuteStoredProcedureAsync(this DbContext context, string procedureName, IDictionary<string, object>? parameters, DbConnection? connection)
    {
        connection ??= context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = connection.CreateCommand();
        command.CommandText = procedureName;
        command.CommandType = CommandType.StoredProcedure;

        parameters?.ToList().ForEach(d =>
        {
            var param = command.CreateParameter();
            param.ParameterName = d.Key;
            param.Value = d.Value;
            command.Parameters.Add(param);
        });

        await using var reader = await command.ExecuteReaderAsync();
        var columnNames = (await reader.GetSchemaTableAsync())?
            .AsEnumerable()
            .Select(row => (string)row["ColumnName"])
            .ToList();

        var results = new List<dynamic>();
        while (await reader.ReadAsync())
        {
            var obj = new ExpandoObject() as IDictionary<string, object>;

            columnNames?.ForEach(d =>
            {
                var value = reader[d];
                obj.Add(d, value);
            });
            results.Add(obj);
        }

        await connection.CloseAsync();
        return results;
    }
}