DROP TABLE IF EXISTS `search_fts`; 
CREATE VIRTUAL TABLE `search_fts` USING fts5(
	object_key UNINDEXED, 
	type UNINDEXED, 
	org UNINDEXED, 
	search_data);