export function FolderCardSkeleton(): JSX.Element {
  return (
    <article className="archiveFolderCard archiveFolderCardSkeleton" aria-busy="true">
      <div className="archiveFolderCardHead">
        <div className="skeletonBox skeletonTitle"></div>
        <div className="skeletonBox skeletonButton"></div>
      </div>
      <ul className="archiveDiagramStack">
        {[1, 2, 3].map((i) => (
          <li key={i} className="archiveDiagramTile archiveDiagramTileSkeleton">
            <div className="skeletonBox skeletonIcon"></div>
            <div className="archiveDiagramTileMain">
              <div className="skeletonBox skeletonText"></div>
              <div className="skeletonBox skeletonMeta"></div>
            </div>
            <div className="archiveDiagramTileActions">
              <div className="skeletonBox skeletonButton"></div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ArchiveLoadingSkeleton(): JSX.Element {
  return (
    <div className="archiveBoard">
      <FolderCardSkeleton />
      <FolderCardSkeleton />
    </div>
  );
}
