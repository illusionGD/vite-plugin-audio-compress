/**
 * 并发任务池
 * Concurrency task pool.
 * @param limit 并发上限 / Max concurrency.
 */
export function createConcurrencyPool(limit: number) {
  const maxConcurrency = Math.max(1, limit);
  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (activeCount >= maxConcurrency || queue.length === 0) {
      return;
    }
    activeCount += 1;
    const task = queue.shift();
    if (task) {
      task();
    }
  };

  /**
   * 运行任务
   * Run a task with concurrency limit.
   * @param task 任务函数 / Task factory.
   */
  const run = async <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const execute = () => {
        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            activeCount -= 1;
            next();
          });
      };

      queue.push(execute);
      next();
    });

  return { run };
}

/**
 * 并发池实例类型
 * Concurrency pool instance type.
 */
export type ConcurrencyPool = ReturnType<typeof createConcurrencyPool>;
