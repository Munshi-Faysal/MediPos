using Domain.Data;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts.Base;
using Shared.Enums;
using System.Linq.Expressions;

namespace Repositories.Concretes.Base;

public class BaseRepository<T>(WfDbContext context) : IBaseRepository<T>
    where T : class
{
    protected readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<IQueryable<T>> AllAsync()
    {
        return (await _dbSet.AsNoTracking().ToListAsync()).AsQueryable();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<bool> DeleteAsync(T entity)
    {
        _dbSet.Remove(entity);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteRangeAsync(IEnumerable<T> entities)
    {
        _dbSet.RemoveRange(entities);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<T?> FindByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<T?> GetInsertedObjAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        return await context.SaveChangesAsync() > 0 ? entity : null;
    }

    public async Task<bool> InsertAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> InsertRangeAsync(IEnumerable<T> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateAsync(T entity)
    {
        var result = _dbSet.Attach(entity);
        result.State = EntityState.Modified;
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateRangeAsync(IEnumerable<T> entities)
    {
        _dbSet.UpdateRange(entities);
        return await context.SaveChangesAsync() > 0;
    }

    public string GetUserNameById(int id)
    {
        return context.Users
            .Where(d => d.Id == id)
            .Select(d => d.DisplayName)
            .FirstOrDefault() ?? nameof(CommonKeyword.Unknown);
    }

    public static string GetUserNameById(int id, WfDbContext context)
    {
        return context.Users
            .Where(d => d.Id == id)
            .Select(d => d.DisplayName)
            .FirstOrDefault() ?? nameof(CommonKeyword.Unknown);
    }

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> expression)
    {
        return await _dbSet.AnyAsync(expression);
    }

    public async Task<List<T>> FindByCondition(Expression<Func<T, bool>> expression)
    {
        return await _dbSet.Where(expression).AsNoTracking().ToListAsync();
    }
}