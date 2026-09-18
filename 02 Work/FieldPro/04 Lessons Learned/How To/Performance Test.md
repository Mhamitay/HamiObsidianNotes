# C# Performance Testing — Stopwatch vs GC Allocations

## Purpose

Use two complementary measurements when comparing C# implementations:

1. **`Stopwatch`** → measures how long an operation takes.
2. **`GC.GetAllocatedBytesForCurrentThread()`** → measures how much managed memory the current thread allocates while performing the operation.

They answer different questions. A method can be fast but allocate heavily, or allocate very little but take longer.

---

## 1. Stopwatch — Measure Execution Time

`Stopwatch` measures **elapsed wall-clock time**.

### Basic pattern

```csharp
var stopwatch = Stopwatch.StartNew();

var result = SomeOperation();

stopwatch.Stop();

Debug.WriteLine(
    $"SomeOperation took {stopwatch.ElapsedMilliseconds} ms"
);
```

### When to use it

Use `Stopwatch` when you want to know:

- How long an operation takes from the application's perspective.
- Which implementation is faster.
- Whether a change improves end-to-end execution time.
- How long a database call takes when measured from C#.

### Important

`Stopwatch` measures **elapsed time**, not just CPU time.

For example:

```text
CPU time     = 46 ms
Elapsed time = 402 ms
```

The difference can include waiting for:

- SQL Server
- Network I/O
- Locks
- Other external resources
- Scheduling

Therefore, when testing a database call from C#, elapsed time is often the number that best represents what the application experiences.

---

## 2. GC.GetAllocatedBytesForCurrentThread() — Measure Managed Allocations

```csharp
long before = GC.GetAllocatedBytesForCurrentThread();

var result = SomeOperation();

long after = GC.GetAllocatedBytesForCurrentThread();

long allocated = after - before;

Debug.WriteLine(
    $"Allocated: {allocated:N0} bytes"
);
```

This measures the amount of **managed memory allocated by the current .NET thread** during the measured section.

### When to use it

Use it when you want to know whether an implementation creates unnecessary managed objects or buffers.

It is useful for comparing things such as:

- `string` creation
- `string.Join(...)`
- LINQ operations
- Lists and arrays
- DTO/model creation
- Data transformation
- Serialization/deserialization
- Different ways of passing data to a database

### Important distinction

This is **allocation**, not total memory currently in use.

It does not tell you:

- How much memory the process currently occupies.
- How much memory remains after garbage collection.
- The total memory used by all threads.

It tells you how many managed bytes were allocated by the **current thread** during the measured operation.

---

## 3. Measure Time and Allocation Together

For a fair comparison, measure the same section of code with both counters:

```csharp
long allocatedBefore =
    GC.GetAllocatedBytesForCurrentThread();

var stopwatch = Stopwatch.StartNew();

var result = SomeOperation();

stopwatch.Stop();

long allocatedAfter =
    GC.GetAllocatedBytesForCurrentThread();

long allocatedBytes =
    allocatedAfter - allocatedBefore;

Debug.WriteLine(
    $"Time: {stopwatch.ElapsedMilliseconds} ms"
);

Debug.WriteLine(
    $"Allocated: {allocatedBytes:N0} bytes"
);
```

This gives two independent results:

```text
Time:       488 ms
Allocated:  XXX bytes
```

---

## 4. What Each Measurement Answers

| Measurement | Question it answers |
|---|---|
| `Stopwatch` | How long did the operation take? |
| GC allocated bytes | How much managed memory did this thread allocate? |
| SQL `STATISTICS TIME` CPU | How much CPU did SQL Server use? |
| SQL `STATISTICS TIME` elapsed | How long did SQL Server take, including waits? |
| SQL `STATISTICS IO` | How much logical/physical I/O did SQL Server perform? |

These measurements should not be treated as interchangeable.

---

## 5. For Database Performance Tests

When comparing two database implementations from C#, measure the **same boundary** for both calls.

Example:

```csharp
long before = GC.GetAllocatedBytesForCurrentThread();
var stopwatch = Stopwatch.StartNew();

var existingAssets =
    domain.SelectByIdsForBatchUpdate(ids);

stopwatch.Stop();

long allocated =
    GC.GetAllocatedBytesForCurrentThread() - before;

Debug.WriteLine(
    $"CSV: {stopwatch.ElapsedMilliseconds} ms, " +
    $"Allocated: {allocated:N0} bytes"
);
```

Then perform the same measurement for the alternative implementation:

```csharp
long before = GC.GetAllocatedBytesForCurrentThread();
var stopwatch = Stopwatch.StartNew();

var existingAssets =
    domain.SelectByIdsForBatchUpdate_TVP(ids);

stopwatch.Stop();

long allocated =
    GC.GetAllocatedBytesForCurrentThread() - before;

Debug.WriteLine(
    $"TVP: {stopwatch.ElapsedMilliseconds} ms, " +
    $"Allocated: {allocated:N0} bytes"
);
```

### Why measure both?

Suppose:

```text
CSV
Time:       1,196 ms
Allocation: 500 KB

TVP
Time:         488 ms
Allocation: 300 KB
```

That tells us the TVP implementation is both faster **and** allocating less in that particular test.

But if the results are:

```text
CSV
Time:       1,196 ms
Allocation: 300 KB

TVP
Time:         488 ms
Allocation: 500 KB
```

then TVP is faster, but it allocates more managed memory.

That distinction can be important when the operation runs frequently or at high volume.

---

## 6. Avoid Drawing Conclusions From One Run

Performance measurements can vary because of:

- SQL Server caching
- Network conditions
- CPU scheduling
- Concurrent database activity
- Garbage collection
- JIT compilation
- Connection pooling
- Cold vs warm execution

For meaningful comparisons:

1. Run each implementation multiple times.
2. Keep the input data the same.
3. Keep the number of IDs the same.
4. Measure the same C# code boundary.
5. Compare averages or distributions rather than one isolated run.
6. Separately inspect SQL Server execution plans and `STATISTICS IO/TIME`.

### Rule of thumb

**Use `Stopwatch` to answer:**

> "Which implementation is faster for my application?"

**Use `GC.GetAllocatedBytesForCurrentThread()` to answer:**

> "Which implementation allocates more managed memory on this thread?"

Use both when you care about **performance and memory behavior**.

#performance #test
