const paginate = (totalCount: number, page: number, pageSize: number) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  return {
    currentPage: page,
    pageSize,
    totalRecords: totalCount,
    totalPages,
    hasMore,
  };
};

export { paginate };
