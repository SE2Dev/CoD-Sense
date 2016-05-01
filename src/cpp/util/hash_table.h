#pragma once
#include "llist.h"

class HashKey
{
private:
	const char* str;
	int hash;

public:
	HashKey(void);
	HashKey(const char*);
	HashKey(const HashKey& key);
	~HashKey(void);
	
	HashKey& operator=(const HashKey&);
	
	int Hash(void) const;
	const char* Key(void) const;
};

template <typename T>
class HashNode
{
private:
	HashKey key;
	T* value;

public:
	HashNode<T>* prev;
	HashNode<T>* next;

	HashNode(void);
	HashNode(HashKey key);
	
	~HashNode(void);
	
	int Hash(void) const;
	const char* Key(void) const;
	
	T** Value(void);
};

template <typename T>
HashNode<T>::HashNode(void) :  value(NULL), prev(NULL), next(NULL)
{
}

template <typename T>
HashNode<T>::HashNode(HashKey key) :  value(NULL), prev(NULL), next(NULL)
{
	this->key = HashKey(key.Key());
}

template <typename T>
HashNode<T>::~HashNode()
{
	if(this->prev)
	{
		if(next)
		{
			next->prev = prev;
			prev->next = next;
		}
		else
		{
			prev->next = NULL;
		}
	}
	else if(this->next)
	{
		next->prev = NULL;
	}
	
	delete value;
	value = NULL;
}

template <typename T>
int HashNode<T>::Hash(void) const
{
	return key.Hash();
}

template <typename T>
const char* HashNode<T>::Key(void) const
{
	return key.Key();
}

template <typename T>
T** HashNode<T>::Value(void)
{
	return &this->value;
}

template <typename T>
class HashTable
{
private:
	static const int bucketCount = 256; //bucketCount must be a power of 2
	static const int hashMask = bucketCount - 1;
	HashNode<T>** buckets;
	
public:
	HashTable(void);
	~HashTable(void);
	
	T**		Get(HashKey key);
	
	//void	Remove(HashKey key);
};

template <typename T>
HashTable<T>::HashTable()
{
	this->buckets = new HashNode<T>*[bucketCount];
	memset(buckets, 0, sizeof(HashNode<T>*) * bucketCount);
}

template <typename T>
HashTable<T>::~HashTable()
{
	for(int i = 0; i < bucketCount; i++)
	{
		for(HashNode<T>* bucket = buckets[i]; bucket;)
		{
			HashNode<T>* next = bucket->next;
			delete bucket;
			bucket = next;
		}
		
		buckets[i] = NULL;
	}
	
	delete[] buckets;
}

//
// Returns a pointer to the object pointer
// if the retval dereferences to a null ptr there is no object for that node
//
template <typename T>
T** HashTable<T>::Get(HashKey key)
{
	if(buckets[key.Hash() & hashMask] == NULL)
	{
		HashNode<T>* node = new HashNode<T>(key);
		buckets[key.Hash() & hashMask] = node;
		return node->Value();
	}
	
	for(HashNode<T>* bucket = buckets[key.Hash() & hashMask]; bucket; bucket = bucket->next)
	{
		if(strcmp(bucket->Key(), key.Key()) == 0)
		{
			return bucket->Value();
		}
	}
	
	HashNode<T>* bucket = buckets[key.Hash() & hashMask];
	HashNode<T>* node = new HashNode<T>(key);
	node->next = bucket;
	bucket->prev = node;
	buckets[key.Hash() & hashMask] = node;
	return bucket->Value();
}